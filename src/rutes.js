import Dashboard from "./components/pages/Dashboard"
import FintechList from "./components/pages/FintechList"
import MinterList from "./components/pages/MinterList"
import Start from "./components/pages/Start"
import NFTDetails from "./components/pages/NFTDetails"
import NFTList from "./components/pages/NFTList"
import MintNFT from "./components/pages/MintNFT"
import GridNFT from "./components/pages/Grid"
// import NFTMarket from ".components/pages/NFTMarket"


const routes = [
    {
        path: "/",
        component: Start,   
        exact: true,
        public: true,
        privilege : ["admin"]
    },
    // {
    //     path: "/nftbalance",
    //     component: NFTMarket,   
    //     exact: true,
    //     public: true
    // },
    {
        path: "/dashboard",
        component: Dashboard,
        exact: true,
        public: false,
        privilege : ["admin","financiera"]
    },
    {
        path: "/fintechlist",
        component: FintechList,
        exact: true,
        public: false,
        privilege : ["admin"]
    },
    {
        path: "/minterlist",
        component: MinterList,
        exact: true,
        public: false,
        privilege : ["admin"]
    },
    {
        path: "/mintnft",
        component: MintNFT,
        exact: true,
        public: false,
        privilege : ["admin", "minter", "financiera"]
    },
    {
        path: "/nft-detail/:id",
        component: NFTDetails,
        exact: false,
        public: false,
        privilege : ["admin","financiera"]
    },
    {
        path: "/nft-list/:id",
        component: NFTList,
        exact: true,
        public: false,
        privilege : ["admin","financiera"]
    },
    {
        path: "/gridnft",
        component: GridNFT,
        exact: true,
        public: false,
        privilege : ["admin", "minter", "financiera"]
    }
    
]


export default routes