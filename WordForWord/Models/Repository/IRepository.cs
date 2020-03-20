using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WordForWord.Models.Repository
{
    public interface IRepository<T>: IDisposable where T : class
    {
        IEnumerable<T> GetWords(string keyWord);
    }
}
