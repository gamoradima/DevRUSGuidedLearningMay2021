namespace Terrasoft.Configuration
{
    using System.ServiceModel;
    using System.ServiceModel.Web;
	using System.ServiceModel.Activation;
	using Terrasoft.Core.DB;
	using Terrasoft.Web.Common;
	using System;

	[ServiceContract]
	[AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Required)]
	public class RealtyService : BaseService
    {
		[OperationContract]
		[WebInvoke(Method = "POST", BodyStyle = WebMessageBodyStyle.Wrapped,
	RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
		public decimal GetTotalAmountByTypeId(string realtyTypeId)
		{
			if (string.IsNullOrEmpty(realtyTypeId))
			{
				return -1;
			}
			decimal result = 0;
			Select select = new Select(UserConnection)
				.Column(Func.Sum("UsrPriceUSD"))
				.From("UsrRealty")
				.Where("UsrTypeId").IsEqual(Column.Parameter(new Guid(realtyTypeId))) as Select;
			result = select.ExecuteScalar<decimal>();
			return result;
		}

	}

}

