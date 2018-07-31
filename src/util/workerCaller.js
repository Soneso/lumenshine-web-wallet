import CryptoWorker from '../util/crypto.worker';
const workers = [new CryptoWorker(), new CryptoWorker()];
const workersIdle = [true, true];
const workerCallbacks = [];
const jobQueue = [];

let nextJobId = 0;

function workerResponseHandler (workerIndex, event) {
  const res = event.data;
  const jobId = res.jobId;
  const callbackIndex = workerCallbacks.findIndex(callback => callback.jobId === jobId);
  const callback = workerCallbacks[callbackIndex].callback;
  workerCallbacks.splice(callbackIndex, 1);
  workersIdle[workerIndex] = true;
  if (jobQueue.length > 0) {
    callIdleWorker(jobQueue.shift());
  }
  callback(res.data);
}

function callIdleWorker (cmd) {
  const idleIndex = workersIdle.findIndex(workerIdle => workerIdle);
  if (idleIndex !== -1) {
    workersIdle[idleIndex] = false;
    workers[idleIndex].postMessage(cmd);
    return true;
  }
  return false;
}

function addJob (cmd, handler) {
  const jobId = nextJobId++;
  const newCmd = [jobId, ...cmd];
  workerCallbacks.push({
    jobId,
    callback: handler
  });
  if (!callIdleWorker(newCmd)) {
    jobQueue.push(newCmd);
  }
}

workers.forEach((worker, key) => {
  worker.onmessage = event => workerResponseHandler(key, event);
});

export default function (...command) {
  const jobId = nextJobId;
  return new Promise((resolve, reject) => {
    process.env.NODE_ENV === 'development' && console.log(`Calling worker ${jobId}`, command);
    addJob(command, res => {
      process.env.NODE_ENV === 'development' && console.log(`Worker response ${jobId}`, res);
      resolve(res);
    });
  });
};
