using System.Net;

var root = Path.GetFullPath(Directory.GetCurrentDirectory());
const int port = 5173;

var types = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
{
    [".html"] = "text/html; charset=utf-8",
    [".css"] = "text/css; charset=utf-8",
    [".js"] = "text/javascript; charset=utf-8",
    [".json"] = "application/json",
    [".png"] = "image/png",
    [".jpg"] = "image/jpeg",
    [".jpeg"] = "image/jpeg",
    [".gif"] = "image/gif",
    [".webp"] = "image/webp",
    [".svg"] = "image/svg+xml",
    [".pdf"] = "application/pdf",
};

var listener = new HttpListener();
listener.Prefixes.Add($"http://localhost:{port}/");
listener.Start();
Console.WriteLine($"Serving {root} at http://localhost:{port}/");

while (true)
{
    var ctx = await listener.GetContextAsync();
    _ = Task.Run(async () =>
    {
        try
        {
            var rel = Uri.UnescapeDataString(ctx.Request.Url!.AbsolutePath).TrimStart('/');
            if (rel.Length == 0) rel = "index.html";
            var path = Path.GetFullPath(Path.Combine(root, rel));
            if (!path.StartsWith(root, StringComparison.OrdinalIgnoreCase) || !File.Exists(path))
            {
                ctx.Response.StatusCode = 404;
            }
            else
            {
                ctx.Response.ContentType = types.GetValueOrDefault(Path.GetExtension(path), "application/octet-stream");
                ctx.Response.Headers["Cache-Control"] = "no-store";
                var bytes = await File.ReadAllBytesAsync(path);
                ctx.Response.ContentLength64 = bytes.Length;
                await ctx.Response.OutputStream.WriteAsync(bytes);
            }
        }
        catch (Exception e)
        {
            Console.Error.WriteLine(e.Message);
        }
        finally
        {
            ctx.Response.Close();
        }
    });
}
