import React from 'react';
import { FiTruck, FiClock, FiMapPin, FiDollarSign, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const DeliveryInfoPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">配送信息</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiTruck className="mr-2 text-blue-600" />
          配送方式
        </h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-600 pl-4">
            <h3 className="font-medium text-lg">标准配送</h3>
            <p className="text-gray-600 mt-1">3-5个工作日送达，订单满99元免运费，否则收取10元运费</p>
          </div>
          <div className="border-l-4 border-green-600 pl-4">
            <h3 className="font-medium text-lg">加急配送</h3>
            <p className="text-gray-600 mt-1">1-2个工作日送达，额外收取15元运费</p>
          </div>
          <div className="border-l-4 border-purple-600 pl-4">
            <h3 className="font-medium text-lg">次日达</h3>
            <p className="text-gray-600 mt-1">下单后次日送达（仅限部分城市），额外收取30元运费</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiClock className="mr-2 text-blue-600" />
          配送时间
        </h2>
        <p className="text-gray-600 mb-4">我们的配送时间为周一至周日，上午9点至晚上8点。</p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">配送方式</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">处理时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">配送时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总计时间</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">标准配送</td>
                <td className="px-6 py-4 whitespace-nowrap">1-2个工作日</td>
                <td className="px-6 py-4 whitespace-nowrap">2-3个工作日</td>
                <td className="px-6 py-4 whitespace-nowrap">3-5个工作日</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">加急配送</td>
                <td className="px-6 py-4 whitespace-nowrap">当天</td>
                <td className="px-6 py-4 whitespace-nowrap">1-2个工作日</td>
                <td className="px-6 py-4 whitespace-nowrap">1-2个工作日</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">次日达</td>
                <td className="px-6 py-4 whitespace-nowrap">当天</td>
                <td className="px-6 py-4 whitespace-nowrap">1个工作日</td>
                <td className="px-6 py-4 whitespace-nowrap">1个工作日</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiMapPin className="mr-2 text-blue-600" />
          配送范围
        </h2>
        <p className="text-gray-600 mb-4">我们目前支持中国大陆所有省份的配送，不包括港澳台地区。</p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">次日达支持城市：</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <span className="text-blue-600">北京</span>
            <span className="text-blue-600">上海</span>
            <span className="text-blue-600">广州</span>
            <span className="text-blue-600">深圳</span>
            <span className="text-blue-600">杭州</span>
            <span className="text-blue-600">南京</span>
            <span className="text-blue-600">成都</span>
            <span className="text-blue-600">武汉</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiDollarSign className="mr-2 text-blue-600" />
          配送费用
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">配送方式</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">费用</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">免费条件</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">标准配送</td>
                <td className="px-6 py-4 whitespace-nowrap">10元</td>
                <td className="px-6 py-4 whitespace-nowrap">订单满99元</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">加急配送</td>
                <td className="px-6 py-4 whitespace-nowrap">25元</td>
                <td className="px-6 py-4 whitespace-nowrap">订单满199元</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">次日达</td>
                <td className="px-6 py-4 whitespace-nowrap">30元</td>
                <td className="px-6 py-4 whitespace-nowrap">订单满299元</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiAlertCircle className="mr-2 text-blue-600" />
          注意事项
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>订单确认后，无法更改配送方式和地址</li>
          <li>如遇恶劣天气或特殊情况，配送时间可能会延长</li>
          <li>收货时请检查包装是否完好，如有问题请及时联系客服</li>
          <li>偏远地区可能需要额外的配送时间和费用</li>
          <li>节假日期间配送时间可能会延长</li>
        </ul>
      </div>
    </div>
  );
};

export default DeliveryInfoPage; 