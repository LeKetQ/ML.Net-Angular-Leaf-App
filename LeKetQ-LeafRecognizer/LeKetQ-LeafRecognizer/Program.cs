using LeKetQ_LeafRecognizer;
using Microsoft.Extensions.ML;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddServerSideBlazor();
builder.Services.AddSingleton<LeafRecognizerModel>();
builder.Services.AddPredictionEnginePool<ImageData, ImagePrediction>()
    .FromFile("LeafRecognizerModel.mlnet", true);
builder.Services.AddSingleton(_ => new ImagePredictionService("LeafRecognizerModel.mlnet"));


var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseRouting();

app.MapBlazorHub();
app.MapFallbackToPage("/_Host");

app.Run();
