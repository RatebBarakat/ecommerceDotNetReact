class ErrorHelper {
    static extractErrorMessage(error) {
      if (error.response && error.response.data && error.response.data.errors) {
        return error.response.data.errors;
      }
      return {};
    }
  }
  
  export default ErrorHelper;
  