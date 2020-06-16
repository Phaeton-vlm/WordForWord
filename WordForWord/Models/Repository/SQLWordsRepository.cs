using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace WordForWord.Models.Repository
{
    public class SQLWordsRepository : IRepository<AllWords>
    {
        private readonly AplicationContext db;
        public SQLWordsRepository(AplicationContext context)
        {
            db = context;
        }
        public void Dispose()
        {
            
        }

        public IEnumerable<AllWords> GetWords(string keyWord)
        {

            List<AllWords> words = db.AllWords
                .FromSqlRaw("select * from [dbo].[FindWords]({0})", keyWord)
                .OrderBy(x => x.WordCount)
                .ToList();

            return words;
        }
    }
}
