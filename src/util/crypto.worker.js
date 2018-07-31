import crypto from './crypto';

onmessage = function (e) {
  const jobId = e.data[0];
  const cmd = e.data[1];
  const args = e.data.slice(2);
  const res = {
    cmd,
    jobId,
    data: crypto[cmd].apply(null, args),
  };
  postMessage(res);
};
