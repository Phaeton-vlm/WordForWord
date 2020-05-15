using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Threading.Tasks;

namespace WordForWord
{
    public static class PaintingSet
    {
        public static readonly Brush BlackBrush;
        public static readonly Brush GrayBrush;
        public static readonly Pen GrayPen;
        public static readonly Pen BlackPen;
        public static readonly Pen BlackPenBold;

        public static readonly Font KeyWordFont;
        public static readonly Font KeyWordNumberFont;
        public static readonly Font TextFont;
        public static readonly Font LightTextFont;
        public static readonly Font LightTextFontSmall;
        static PaintingSet()
        {
            BlackBrush = new SolidBrush(Color.Black);
            GrayBrush = new SolidBrush(Color.FromArgb(198, 198, 198));
            GrayPen = new Pen(Color.FromArgb(198, 198, 198), 10f);
            BlackPen = new Pen(Color.Black, 2f);
            BlackPenBold = new Pen(Color.Black, 8f);
            KeyWordFont = new Font(new FontFamily("Arial"), 100f, FontStyle.Bold, GraphicsUnit.Pixel);
            KeyWordNumberFont = new Font(new FontFamily("Arial"), 55f, FontStyle.Bold, GraphicsUnit.Pixel);
            TextFont = new Font(new FontFamily("Arial"), 70f, FontStyle.Bold, GraphicsUnit.Pixel);
            LightTextFont = new Font(new FontFamily("Arial"), 100f, FontStyle.Regular, GraphicsUnit.Pixel);
            LightTextFontSmall = new Font(new FontFamily("Arial"), 30f, FontStyle.Regular, GraphicsUnit.Pixel);
        }
    }
}
