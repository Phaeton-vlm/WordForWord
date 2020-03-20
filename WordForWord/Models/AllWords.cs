using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace WordForWord.Models
{
    public class AllWords
    {
        [Key]
        public int WordID { get; set; }
        public string Word { get; set; } 
        public int WordCount { get; set; } 
    }
}
