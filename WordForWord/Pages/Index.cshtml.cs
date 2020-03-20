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

namespace WordForWord.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;

        private readonly IRepository<AllWords> AllWordsRepository;
        public IEnumerable<AllWords> Words { get; set; }

        public IndexModel(ILogger<IndexModel> logger, IRepository<AllWords> repository)
        {
            _logger = logger;
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
    }
}
