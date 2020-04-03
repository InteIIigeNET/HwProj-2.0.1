using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HwProj.CourseWorkService.API.Models.ViewModels
{
    public class CreateBidViewModel
    {
        public int BidValue { get; set; }
        public long CourseWorkId { get; set; }
    }
}
