// ImagePredictionService.cs
using LeKetQ_LeafRecognizer;
using Microsoft.ML;

public class ImagePredictionService
{
    private readonly MLContext mlContext;
    private readonly ITransformer mlModel;

    public ImagePredictionService(string modelPath)
    {
        mlContext = new MLContext();
        mlModel = mlContext.Model.Load(modelPath, out _);
    }

    public async Task<string> Predict(byte[] imageBytes)
    {
        var sampleData = new LeafRecognizerModel.ModelInput()
        {
            ImageSource = imageBytes,
        };

        var prediction = mlContext.Model.CreatePredictionEngine<LeafRecognizerModel.ModelInput, LeafRecognizerModel.ModelOutput>(mlModel)
                                      .Predict(sampleData);

        return prediction.PredictedLabel;
    }
}
