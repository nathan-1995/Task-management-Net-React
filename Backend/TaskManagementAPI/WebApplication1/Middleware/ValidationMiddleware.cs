using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Text.Json;

namespace TaskManagementAPI.Middleware
{
    public class ValidationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ValidationMiddleware> _logger;

        public ValidationMiddleware(RequestDelegate next, ILogger<ValidationMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Try to process the request
            await _next(context);

            // Handle validation errors
            if (context.Response.StatusCode == 400 && context.Items["ValidationErrors"] is ModelStateDictionary modelState)
            {
                // Extract validation errors
                var errors = modelState
                    .Where(ms => ms.Value?.Errors?.Count > 0) // Check for null values safely
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>() // Handle null with fallback
                    );

                // Log the validation errors
                _logger.LogWarning("Validation errors occurred: {@Errors}", errors);

                // Format the response
                var response = new
                {
                    Status = 400,
                    Message = "Validation failed.",
                    Errors = errors
                };

                // Set the content type and response body
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync(JsonSerializer.Serialize(response));
            }
        }
    }
}
