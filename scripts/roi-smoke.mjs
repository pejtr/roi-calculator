/**
 * Offline E2E smoke after `pnpm build`. No production credentials or real PII.
 * Runs the actual compiled Express server against a localhost-only fake LEAD OS.
 */
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return server.address().port;
}
async function unusedPort() {
  const server=createServer();
  const port=await listen(server);
  await new Promise(resolve=>server.close(resolve));
  return port;
}

const requests=[];
let failUpstream=false;
const upstream=createServer(async(req,res)=>{
  let body="";
  for await(const chunk of req) body+=chunk.toString();
  requests.push({path:req.url,key:req.headers["x-leados-key"],body:JSON.parse(body)});
  res.setHeader("Content-Type","application/json");
  res.statusCode=failUpstream?503:200;
  res.end(JSON.stringify({ok:!failUpstream}));
});
const upstreamPort=await listen(upstream);
const roiPort=await unusedPort();
const origin="http://127.0.0.1:"+roiPort;
const child=spawn(process.execPath,["dist/index.js"],{
  cwd:process.cwd(),
  env:{
    ...process.env,
    NODE_ENV:"production",
    PORT:String(roiPort),
    LEADOS_BASE_URL:"http://127.0.0.1:"+upstreamPort,
    LEADOS_PROJECT_API_KEY:"test-project-key-not-a-real-credential",
    ROI_ALLOWED_ORIGINS:"",
  },
  stdio:"ignore",
});

async function post(data,headers={}){
  return fetch(origin+"/api/leads",{
    method:"POST",
    headers:{"content-type":"application/json",origin,...headers},
    body:JSON.stringify(data),
  });
}
const fixture={
  name:"QA Test",
  email:"qa@example.invalid",
  biggestChallenge:"Test only",
  consent:true,website:"",
  creatorType:"educator",offer:"mini-audit",
  pageUrl:origin+"/?utm_source=qa",
  scenario:{followers:10000,engagementRate:3,currentMonthlyRevenue:5000},
  utmSource:"smoke-test",
};
try{
  let online=false;
  for(let i=0;i<70;i++){
    if(child.exitCode!==null) throw new Error("ROI server exited early");
    try{
      const r=await fetch(origin+"/",{signal:AbortSignal.timeout(500)});
      if(r.ok){online=true;break;}
    }catch{}
    await sleep(100);
  }
  assert(online,"ROI server was not reachable within deadline");

  assert.equal((await post(fixture,{origin:"https://untrusted.example"})).status,403,"reject foreign origin");
  assert.equal((await fetch(origin+"/api/leads",{method:"POST",body:"{}",headers:{origin,"content-type":"text/plain"}})).status,415,"enforce JSON");
  assert.equal((await post({...fixture,consent:false})).status,400,"enforce consent");
  assert.equal((await post({...fixture,pageUrl:"javascript:alert(1)"})).status,400,"reject unsafe URL");
  const saved=await post(fixture);
  assert.equal(saved.status,201,"success only after LEAD OS acknowledges");
  assert.equal((await saved.json()).ok,true);
  assert.equal(requests.length,1,"exactly one upstream request");
  assert.equal(requests[0].path,"/api/leads/ingest");
  assert.equal(requests[0].key,"test-project-key-not-a-real-credential");
  assert.equal(requests[0].body.source,"creator-roi-calculator");
  assert.equal(requests[0].body.utm_source,"smoke-test");
  assert.equal(requests[0].body.url,origin+"/","query parameters stripped before CRM");
  failUpstream=true;
  const declined=await post(fixture);
  assert.equal(declined.status,502,"never confirm a failed upstream ingest");
  assert.equal((await declined.json()).ok,false);
  process.stdout.write("PASS: ROI compiled HTTP smoke (403/415/400/201/502, fake LEAD OS)\\n");
}catch(error){
  console.error("FAIL:",error instanceof Error ? error.message : "unknown");
  process.exitCode=1;
}finally{
  child.kill();
  await new Promise(resolve=>upstream.close(resolve));
}
