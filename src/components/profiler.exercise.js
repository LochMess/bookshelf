import * as React from 'react'
import {client} from 'utils/api-client'
import {unstable_trace as trace, unstable_wrap as wrap} from 'scheduler/tracing'

let queue = []

function sendQueue() {
  if (!queue.length) {
    return Promise.resolve({success: true})
  } else {
    const queueToSend = [...queue]
    queue = []
    return client('profile', {data: queueToSend})
  }
}

setInterval(sendQueue, 5000)

function Profiler({id, phases, metadata, ...props}) {
  function sendMetrics(
    id, // the "id" prop of the Profiler tree that has just committed
    phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
    actualDuration, // time spent rendering the committed update
    baseDuration, // estimated time to render the entire subtree without memoization
    startTime, // when React began rendering this update
    commitTime, // when React committed this update
    interactions, // the Set of interactions belonging to this update
  ) {
    if (!phases || phases?.includes(phase)) {
      const data = {
        id,
        phase,
        metadata,
        actualDuration,
        baseDuration,
        startTime,
        commitTime,
        interactions: [...interactions], // Convert Set to an Array so can be parsed by JSON.stringify
      }
      queue.push(data)
    }
  }
  return <React.Profiler id={id} onRender={sendMetrics} {...props} />
}

export {Profiler, trace, wrap}
