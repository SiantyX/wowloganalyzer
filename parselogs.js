import { callWLAPI } from "./warcraftlogs.js";



async function getManaPots(logId) {
  const query = {
    query: `{
      reportData {
        report(code: "${logId}") {
          events(dataType: Casts, abilityID: 28499, startTime: 0, endTime: 99999999, useActorIDs: false) {
            data
            nextPageTimestamp
          }
        }
      }
    }`
  } 

  const res = await callWLAPI(query);
  if (res.status != 200) {
    throw new Error(`${res.status} - ${res.statusText}`);
  }

  const data = await res.json();

  return data;
}

getManaPots("pmxJZcQ1f37w94jd").then(d => console.log(d));