const { ethers } = require("ethers");

const RPC_URL = "https://rpc.ankr.com/somnia_testnet/6e3fd81558cf77b928b06b38e9409b4677b637118114e83364486294d5ff4811";
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Contract addresses aligned with variables
const contractMap = {
  snkA: "0x696ee979e8CC1D5a2CA7778606a3269C00978346",
  snkScore: "0x5Cb442D8A3D7A7153BE93202e232919bE3C84C5A",
  dashScore: "0xcC54e8129EE25af45F1B489D8fD3960Ce54684eB",
};

// Completion conditions for each Call
const completionThresholds = {
  snkA: 10,
  snkScore: 3500,
  dashScore: 7000,
};

const ABI = ["function balanceOf(address) view returns (uint256)"];

module.exports = async (req, res) => {
  const { address } = req.query;

  if (!address || !ethers.isAddress(address)) {
    return res.status(400).json({ error: "Invalid wallet address" });
  }

  const data = {};

  for (const [key, contractAddress] of Object.entries(contractMap)) {
    try {
      const contract = new ethers.Contract(contractAddress, ABI, provider);
      const balanceBN = await contract.balanceOf(address);
      const balance = parseFloat(ethers.formatUnits(balanceBN, 18)); // assuming 18 decimals

      const threshold = completionThresholds[key];
      const completed = typeof threshold === "number" ? balance > threshold : null;

      data[key] = {
        balance,
        completed
      };
    } catch (error) {
      data[key] = {
        balance: null,
        completed: false,
        error: error.message
      };
    }
  }

  res.status(200).json({
    wallet: address,
    data
  });
};
