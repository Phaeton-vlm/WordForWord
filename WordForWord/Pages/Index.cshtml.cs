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
            //return new PartialViewResult
            //{
            //    ViewName = "WordsResultPartial",
            //    ViewData = new ViewDataDictionary<IEnumerable<AllWords>>(ViewData, Words)
            //};
        }

        public FileResult OnGetCreateDocx()
        {
            //string path = Path.Combine(_appEnvironment.ContentRootPath, "Files/Test.docx");
            //FileStream fs = new FileStream(path, FileMode.Open);

            MemoryStream memoryStream = new MemoryStream();

            Bitmap template = new Bitmap(100, 100);
            System.Drawing.Image img = template;

            var j = Graphics.FromImage(img);
            Pen pen = new Pen(Color.Black, 1.5f);
            j.DrawRectangle(pen, 5, 5, 50, 50);

            Stream imageStream = new MemoryStream();
            img.Save(imageStream,System.Drawing.Imaging.ImageFormat.Png);
            imageStream.Seek(0, SeekOrigin.Begin);

            DocX document = DocX.Create(memoryStream);

            

            var streamImage = document.AddImage(imageStream);
            var pictureStream = streamImage.CreatePicture();
            var p3 = document.InsertParagraph("Here is the same picture added from a stream:");
            p3.AppendPicture(pictureStream);

            document.Save();


            memoryStream.Seek(0, SeekOrigin.Begin);

            string file_type = "application/docx";
            string file_name = "test.docx";
            return File(memoryStream, file_type, file_name);



        }
    }
}
