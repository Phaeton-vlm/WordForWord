using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using WordForWord.Models;
using WordForWord.Models.Repository;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System.Drawing;
using System.IO;
using System.Net.Http;
using Microsoft.AspNetCore.Hosting;
using Novacode;
using System.Collections;

namespace WordForWord.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _appEnvironment;

        private readonly IRepository<AllWords> AllWordsRepository;
        public IEnumerable<AllWords> Words { get; set; }

        public IndexModel(ILogger<IndexModel> logger, IRepository<AllWords> repository, IWebHostEnvironment appEnvironment)
        {
            _logger = logger;
            _appEnvironment = appEnvironment;

            AllWordsRepository = repository;
        }

        public void OnGet()
        {

        }

        public JsonResult OnGetWordsResult(string keyWord)
        {
            Words = AllWordsRepository.GetWords(keyWord);

            return new JsonResult(Words);
        }

        public FileResult OnGetCreateDocx(string keyword,string words,string wordsForStudent, string fillwordString, string fillwordFullString, string sudokuString, string crosswordString, string chessString, string chessWord)
        {

            List<char> lettersArray = new List<char>(keyword.Length);
            List<string> wordsArray = CreateWordList(words);
            List<string> wordsArrayForStudent = CreateWordList(wordsForStudent);

            for (int i = 0; i < keyword.Length; i++)
            {
                if (!lettersArray.Contains(keyword[i]))
                {
                    lettersArray.Add(keyword[i]);
                }
            }

            MemoryStream memoryStream = new MemoryStream();

            
            System.Drawing.Image imgForTeacher = PageForTeacher(keyword, wordsArray, lettersArray, fillwordString, sudokuString, crosswordString, chessString, chessWord);
            System.Drawing.Image imgForStudent = PageForStudent(keyword, wordsArrayForStudent, lettersArray, fillwordFullString, sudokuString, crosswordString, chessString, chessWord);

            Stream imageTeacherStream = new MemoryStream();
            Stream imageStudentStream = new MemoryStream();

            imgForTeacher.Save(imageTeacherStream, System.Drawing.Imaging.ImageFormat.Png);
            imgForStudent.Save(imageStudentStream, System.Drawing.Imaging.ImageFormat.Png);

            imageTeacherStream.Seek(0, SeekOrigin.Begin);
            imageStudentStream.Seek(0, SeekOrigin.Begin);

            DocX document = DocX.Create(memoryStream);
            document.MarginTop = 6f;
            document.MarginLeft = 6f;

            var streamImageTeacher = document.AddImage(imageTeacherStream);
            var streamImageStudent = document.AddImage(imageStudentStream);

            var pictureStreamTeacher = streamImageTeacher.CreatePicture(1096, 775);
            var pictureStreamStudent = streamImageStudent.CreatePicture(1096, 775);

            var p3 = document.InsertParagraph();
            p3.AppendPicture(pictureStreamTeacher).Alignment = Alignment.center;
            p3.AppendPicture(pictureStreamStudent).Alignment = Alignment.center;

            document.Save();


            memoryStream.Seek(0, SeekOrigin.Begin);

            string file_type = "application/docx";
            string file_name = "file.docx";
            return File(memoryStream, file_type, file_name);
        }

        const int MAX_ROW_COUNT = 18;
        private System.Drawing.Image PageForTeacher(string keyword,List<string> wordsArray, List<char> lettersArray, string fillwordString, string sudokuString, string crosswordString,string chessString, string chessWord)
        {
            Bitmap template = new Bitmap(2480, 3508);
            System.Drawing.Image image = template;

            var graphics = Graphics.FromImage(image);

            graphics.FillRectangle(PaintingSet.GrayBrush, 2100, 50, 200, 50);
            graphics.DrawString("Учителю", PaintingSet.LightTextFontSmall, PaintingSet.BlackBrush, 2130, 60);


            int currentRow = 0;
            int currentCell = 0;
            int remainingСells = 0;

            //Вывод слов: START
            for (int i = 0; i < wordsArray.Count; i++)
            {
                remainingСells += (wordsArray[i].Length + 1);
                if(remainingСells > MAX_ROW_COUNT)
                {
                    remainingСells = wordsArray[i].Length + 1;
                    currentRow++;
                    currentCell = 0;
                }

                for (int j = 0; j < wordsArray[i].Length; j++)
                {
                    graphics.DrawRectangle(PaintingSet.BlackPen, 125 + (130 * currentCell), 500 + (150 * currentRow), 130, 130);
                    graphics.DrawString(wordsArray[i][j].ToString(), PaintingSet.LightTextFont, PaintingSet.BlackBrush, 125 + (130 * currentCell) + 10, 500 + (150 * currentRow));
                    graphics.FillRectangle(PaintingSet.GrayBrush, 125 + (130 * currentCell) + 1, 500 + (150 * currentRow), 128, 30);
                    graphics.DrawString((lettersArray.FindIndex(0, x => x == wordsArray[i][j]) + 1).ToString(), PaintingSet.LightTextFontSmall, PaintingSet.BlackBrush, 125 + (130 * currentCell) + 100, 500 + (150 * currentRow));
                    currentCell++;
                }

                currentCell++;
            }
            //Вывод слов: END

            int currentPosition = 215;
            int letterlength = 0;
            const int spacing = 10;
            
            //Вывод ключевого слова: START
            for (int i = 0; i < keyword.Length; i++)
            {
                graphics.DrawString(keyword[i].ToString(), PaintingSet.KeyWordFont, PaintingSet.BlackBrush, currentPosition, 180);
                letterlength = (int)graphics.MeasureString(keyword[i].ToString(), PaintingSet.KeyWordFont).Width;

                graphics.DrawString((lettersArray.FindIndex(0, x => x == keyword[i]) + 1).ToString(), PaintingSet.KeyWordNumberFont, PaintingSet.BlackBrush, currentPosition + (letterlength/3), 330);
                currentPosition += letterlength + spacing;
            }

            graphics.DrawRectangle(PaintingSet.GrayPen, 125, 140, (80 + currentPosition - spacing - letterlength), 180);
            graphics.DrawRectangle(PaintingSet.GrayPen, 125, 320, (80 + currentPosition - spacing - letterlength), 80);
            //Вывод ключевого слова: END

            //Вывод филворда: START
            graphics.DrawString("Филворд", PaintingSet.TextFont, PaintingSet.BlackBrush, 300, 1450);
            for (int i = 0, z = 0; i < 4; i++)
            {
                for (int j = 0; j < 7; j++)
                {
                    graphics.DrawRectangle(PaintingSet.BlackPen, 125 + (130 * j), 1550 + (130 * i), 130, 130);
                    if(fillwordString[z].ToString() != 0.ToString())
                    {
                        graphics.DrawString(fillwordString[z].ToString(), PaintingSet.LightTextFont, PaintingSet.BlackBrush, 125 + (130 * j) + 10, 1550 + (130 * i));
                    }                  
                    z++;
                }
            }
            //Вывод филворда: END

            //Вывод судоку: START
            graphics.DrawString("Судоку", PaintingSet.TextFont, PaintingSet.BlackBrush, 1620, 1450);
            for (int i = 0, z = 0; i < 4; i++)
            {
                for (int j = 0; j < 4; j++)
                {
                    graphics.DrawRectangle(PaintingSet.BlackPen, 1500 + (130 * j), 1550 + (130 * i), 130, 130);
                    graphics.DrawString(sudokuString[z].ToString(), PaintingSet.LightTextFont, PaintingSet.BlackBrush, 1500 + (130 * j) + 10, 1550 + (130 * i));
                    z++;
                }
            }
            //Вывод судоку: END

            //Вывод кроссворда: START

            if(crosswordString != "none")
            {
                int counterForCrossword = 0;
                int secretWordLenght = 0;
                graphics.DrawString("Кроссворд", PaintingSet.TextFont, PaintingSet.BlackBrush, 300, 2325);
                for (int i = 0, z = 0; i < 8; i++)
                {
                    for (int j = 0; j < 7; j++)
                    {
                        counterForCrossword++;
                        if (crosswordString[z].ToString() != 0.ToString())
                        {
                            graphics.DrawRectangle(PaintingSet.BlackPen, 125 + (130 * j), 2425 + (130 * i), 130, 130);
                            graphics.DrawString(crosswordString[z].ToString(), PaintingSet.LightTextFont, PaintingSet.BlackBrush, 125 + (130 * j) + 10, 2425 + (130 * i));

                            if (counterForCrossword != 4)
                            {
                                graphics.FillRectangle(PaintingSet.GrayBrush, 125 + (130 * j) + 1, 2425 + (130 * i), 128, 30);
                                graphics.DrawString((lettersArray.FindIndex(0, x => x == crosswordString[z]) + 1).ToString(), PaintingSet.LightTextFontSmall, PaintingSet.BlackBrush, 125 + (130 * j) + 100, 2425 + (130 * i));

                            }

                            if (counterForCrossword == 4)
                            {
                                secretWordLenght++;
                            }
                        }
                        z++;
                    }
                    counterForCrossword = 0;
                }

                for (int i = 0; i < secretWordLenght; i++)
                {
                    graphics.DrawRectangle(PaintingSet.BlackPenBold, 125 + (130 * 3), 2425 + (130 * i), 130, 130);
                }
            }
            
            //Вывод кроссворда: END

            //Вывод шахмат: START
            graphics.DrawString("Шахматы", PaintingSet.TextFont, PaintingSet.BlackBrush, 1620, 2325);
            for (int i = 0, z = 0; i < 8; i++)
            {
                for (int j = 0; j < 8; j++)
                {
                    graphics.DrawRectangle(PaintingSet.BlackPen, 1340 + (110 * j), 2425 + (110 * i), 110, 110);

                    if (chessString[z].ToString() != 0.ToString())
                    {
                        if(chessString[z].ToString() == "R")
                        {
                            graphics.DrawImage(new Bitmap("Icons/rook.png"), 1340 + (110 * j) + 10, 2425 + (110 * i) + 6,95,95);
                            z++;
                            continue;
                        }

                        if (chessString[z].ToString() == "B")
                        {
                            graphics.DrawImage(new Bitmap("Icons/bishop.png"), 1340 + (110 * j) + 10, 2425 + (110 * i) + 6, 95, 95);
                            z++;
                            continue;
                        }

                        graphics.DrawString(chessString[z].ToString(), PaintingSet.LightTextFont, PaintingSet.BlackBrush, 1340 + (110 * j) + 10, 2425 + (110 * i));
                    }
                    z++;
                }
            }

            for (int i = 0; i < chessWord.Length; i++)
            {
                graphics.DrawRectangle(PaintingSet.BlackPen, 1340 + (110 * i), 3340, 110, 110);
                graphics.DrawString(chessWord[i].ToString(), PaintingSet.LightTextFont, PaintingSet.BlackBrush, 1340 + (110 * i) + 10, 3340);

            }
            //Вывод шахмат: END



            return image;
        }
        private System.Drawing.Image PageForStudent(string keyword, List<string> wordsArrayForStudent, List<char> lettersArray, string fillwordFullString, string sudokuString,string crosswordString,string chessString, string chessWord)
        {
            Bitmap template = new Bitmap(2480, 3508);
            System.Drawing.Image image = template;

            var graphics = Graphics.FromImage(image);

            graphics.FillRectangle(PaintingSet.GrayBrush, 2100, 50, 200, 50);
            graphics.DrawString("Ученику", PaintingSet.LightTextFontSmall, PaintingSet.BlackBrush, 2130, 60);

            int currentPosition = 215;
            int letterlength = 0;
            const int spacing = 10;

            //Вывод ключевого слова: START
            for (int i = 0; i < keyword.Length; i++)
            {
                graphics.DrawString(keyword[i].ToString(), PaintingSet.KeyWordFont, PaintingSet.BlackBrush, currentPosition, 180);
                letterlength = (int)graphics.MeasureString(keyword[i].ToString(), PaintingSet.KeyWordFont).Width;

                graphics.DrawString((lettersArray.FindIndex(0, x => x == keyword[i]) + 1).ToString(), PaintingSet.KeyWordNumberFont, PaintingSet.BlackBrush, currentPosition + (letterlength / 3), 330);
                currentPosition += letterlength + spacing;
            }

            graphics.DrawRectangle(PaintingSet.GrayPen, 125, 140, (80 + currentPosition - spacing - letterlength), 180);
            graphics.DrawRectangle(PaintingSet.GrayPen, 125, 320, (80 + currentPosition - spacing - letterlength), 80);
            //Вывод ключевого слова: END

            int currentRow = 0;
            int currentCell = 0;
            int remainingСells = 0;

            //Вывод слов: START
            for (int i = 0; i < wordsArrayForStudent.Count; i++)
            {
                remainingСells += (wordsArrayForStudent[i].Length / 2) + 1;
                if (remainingСells > MAX_ROW_COUNT)
                {
                    remainingСells = (wordsArrayForStudent[i].Length / 2) + 1;
                    currentRow++;
                    currentCell = 0;
                }


                for (int j = 0; j < wordsArrayForStudent[i].Length - 1; j+=2)
                {
                    graphics.DrawRectangle(PaintingSet.BlackPen, 125 + (130 * currentCell), 500 + (150 * currentRow), 130, 130);
                    graphics.FillRectangle(PaintingSet.GrayBrush, 125 + (130 * currentCell) + 1, 500 + (150 * currentRow), 128, 30);

                    if (wordsArrayForStudent[i][j + 1].ToString() == 1.ToString())
                    {
                        graphics.DrawString("?", PaintingSet.LightTextFontSmall, PaintingSet.BlackBrush, 125 + (130 * currentCell) + 100, 500 + (150 * currentRow));

                    }
                    else
                    {
                        graphics.DrawString((lettersArray.FindIndex(0, x => x == wordsArrayForStudent[i][j]) + 1).ToString(), PaintingSet.LightTextFontSmall, PaintingSet.BlackBrush, 125 + (130 * currentCell) + 100, 500 + (150 * currentRow));

                    }

                    currentCell++;
                }

                currentCell++;
            }
            //Вывод слов: END

            //Вывод филворда: START
            graphics.DrawString("Филворд", PaintingSet.TextFont, PaintingSet.BlackBrush, 300, 1450);
            for (int i = 0, z = 0; i < 4; i++)
            {
                for (int j = 0; j < 7; j++)
                {
                    graphics.DrawRectangle(PaintingSet.BlackPen, 125 + (130 * j), 1550 + (130 * i), 130, 130);
                    graphics.DrawString(fillwordFullString[z].ToString(), PaintingSet.LightTextFont, PaintingSet.BlackBrush, 125 + (130 * j) + 10, 1550 + (130 * i));                
                    z++;
                }
            }
            //Вывод филворда: END

            //Вывод судоку: START
            graphics.DrawString("Судоку", PaintingSet.TextFont, PaintingSet.BlackBrush, 1620, 1450);
            for (int i = 0, z = 0; i < 4; i++)
            {
                for (int j = 0; j < 4; j++)
                {
                    graphics.DrawRectangle(PaintingSet.BlackPen, 1500 + (130 * j), 1550 + (130 * i), 130, 130);

                    if (i == j)
                    {        
                        graphics.DrawString((lettersArray.FindIndex(0, x => x == sudokuString[z]) + 1).ToString(), PaintingSet.LightTextFont, PaintingSet.BlackBrush, 1500 + (130 * j) + 10, 1550 + (130 * i));                    
                    }

                    if(i == 3 && j == 0)
                    {
                        graphics.DrawString((lettersArray.FindIndex(0, x => x == sudokuString[z]) + 1).ToString(), PaintingSet.LightTextFont, PaintingSet.BlackBrush, 1500 + (130 * j) + 10, 1550 + (130 * i));
                    }

                    z++;

                }
            }
            //Вывод судоку: END

            //Вывод кроссворда: START
            if(crosswordString != "none")
            {
                int counterForCrossword = 0;
                int secretWordLenght = 0;
                graphics.DrawString("Кроссворд", PaintingSet.TextFont, PaintingSet.BlackBrush, 300, 2325);
                for (int i = 0, z = 0; i < 8; i++)
                {
                    for (int j = 0; j < 7; j++)
                    {
                        counterForCrossword++;
                        if (crosswordString[z].ToString() != 0.ToString())
                        {
                            graphics.DrawRectangle(PaintingSet.BlackPen, 125 + (130 * j), 2425 + (130 * i), 130, 130);
                            if (counterForCrossword != 4)
                            {
                                graphics.FillRectangle(PaintingSet.GrayBrush, 125 + (130 * j) + 1, 2425 + (130 * i), 128, 30);
                                graphics.DrawString((lettersArray.FindIndex(0, x => x == crosswordString[z]) + 1).ToString(), PaintingSet.LightTextFontSmall, PaintingSet.BlackBrush, 125 + (130 * j) + 100, 2425 + (130 * i));

                            }

                            if (counterForCrossword == 4)
                            {
                                secretWordLenght++;
                            }
                        }
                        z++;
                    }
                    counterForCrossword = 0;
                }

                for (int i = 0; i < secretWordLenght; i++)
                {
                    graphics.DrawRectangle(PaintingSet.BlackPenBold, 125 + (130 * 3), 2425 + (130 * i), 130, 130);
                }
            }        
            //Вывод кроссворда: END

            //Вывод шахмат: START
            graphics.DrawString("Шахматы", PaintingSet.TextFont, PaintingSet.BlackBrush, 1620, 2325);
            for (int i = 0, z = 0; i < 8; i++)
            {
                for (int j = 0; j < 8; j++)
                {
                    graphics.DrawRectangle(PaintingSet.BlackPen, 1340 + (110 * j), 2425 + (110 * i), 110, 110);

                    if (chessString[z].ToString() != 0.ToString())
                    {
                        if (chessString[z].ToString() == "R")
                        {
                            graphics.DrawImage(new Bitmap("Icons/rook.png"), 1340 + (110 * j) + 10, 2425 + (110 * i) + 6, 95, 95);
                            z++;
                            continue;
                        }

                        if (chessString[z].ToString() == "B")
                        {
                            graphics.DrawImage(new Bitmap("Icons/bishop.png"), 1340 + (110 * j) + 10, 2425 + (110 * i) + 6, 95, 95);
                            z++;
                            continue;
                        }
                        
                        graphics.DrawString((lettersArray.FindIndex(0, x => x == chessString[z]) + 1).ToString(), PaintingSet.LightTextFont, PaintingSet.BlackBrush, 1340 + (110 * j) + 10, 2425 + (110 * i));
                    }
                    z++;
                }
            }

            for (int i = 0; i < chessWord.Length; i++)
            {
                graphics.DrawRectangle(PaintingSet.BlackPen, 1340 + (110 * i), 3340, 110, 110);
            }
            //Вывод шахмат: END

            return image;
        }
        private List<string> CreateWordList(string words)
        {
            List<string> tempArray = new List<string>();
            string word = string.Empty;

            for (int i = 0; i < words.Length; i++)
            {
                if(words[i].ToString() != 0.ToString())
                {
                    word += words[i];
                }
                else if(words[i].ToString() == 0.ToString())
                {
                    tempArray.Add(word);
                    word = string.Empty;
                }
            }

            return tempArray;
        }
    }
}
