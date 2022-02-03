import AuthProvider from './components/providers/AuthProvider';
import Web3Provider from './components/providers/Web3Provider';
import Layout from './components/layout/Layout';
import { ConfigProvider } from 'antd';
import esES from 'antd/lib/locale/es_ES';
import 'moment/locale/es';


const App = () => {
    return (
        <Web3Provider>
            <AuthProvider>
                <ConfigProvider locale={esES}>
                  <Layout />
                </ConfigProvider>
            </AuthProvider>
        </Web3Provider>
    )
}

export default App