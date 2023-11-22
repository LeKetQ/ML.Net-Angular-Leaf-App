using Microsoft.ML.Data;

public class ImagePrediction
{
    [ColumnName("Score")]
    public float[] PredictedLabels;
}
