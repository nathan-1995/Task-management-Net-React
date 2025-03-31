using Microsoft.AspNetCore.Http;
using System.Net;
using System.Text.Json;

namespace TaskManagementAPI.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Process the next middleware or controller
                await _next(context);
            }
            catch (Exception ex)
            {
                // Handle unhandled exceptions globally
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            // Set response details
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            // Create the error response
            var response = new
            {
                Status = context.Response.StatusCode,
                Message = "An unexpected error occurred.",
                Details = context.RequestServices.GetService<IWebHostEnvironment>()?.IsDevelopment() == true
                    ? exception.Message // Show full error details in Development
                    : null
            };

            // Serialize response
            var jsonResponse = JsonSerializer.Serialize(response);
            return context.Response.WriteAsync(jsonResponse);
        }
    }
}
