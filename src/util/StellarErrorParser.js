export default function (stellarError) {
  if (!stellarError) return null;
  if (stellarError.response && stellarError.response.data && stellarError.response.data.extras) {
    const extras = stellarError.response.data.extras;
    if (extras.result_codes && extras.result_codes.operations && extras.result_codes.operations[0]) {
      const errorCode = extras.result_codes.operations[0];
      return errorCode;
    }
  }
  return null;
};
