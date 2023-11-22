using Microsoft.ML.Data;
using System.Drawing;

public class ImageData
{
    [LoadColumn(0)]
    public Bitmap Image;

    [LoadColumn(1)]
    [VectorType(4)]
    public float[] Label;
}
