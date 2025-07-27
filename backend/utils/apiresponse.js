class ApiResponse {
  constructor(status, message, data = "success") {
    this.status = status;
    this.message = message;
    this.data = data;
    this.statusCode = status === "success" ? 200 : 400;
    this.timestamp = new Date().toISOString();
    this.error = null;

    if (status !== "success") {
      this.error = {
        message: message,
        statusCode: this.statusCode,
        status: status,
        timestamp: this.timestamp,
      };
    }
  }

  send(res) {
    return res.status(this.statusCode).json(this);
  }
}

export default ApiResponse;

// Optional helper if you want quick use:
export const successResponse = (res, message, data) => {
  const response = new ApiResponse("success", message, data);
  return response.send(res);
};
