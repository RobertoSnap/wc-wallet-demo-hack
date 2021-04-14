
import { Button, Heading, TextInput } from 'grommet';
import React, { useEffect, useState } from 'react';
import { WalletConnectWallet } from '../components/WalletConnectWallet';

interface Props { }

export const HomePage: React.FC<Props> = () => {
    const [uri, setUri] = useState<string>();
    const [input, setInput] = useState("");

    useEffect(() => {
        let subscribed = true
        const doAsync = async () => {
            let search = window.location.search;
            let params = new URLSearchParams(search);
            let token = params.get('token');
            console.log("token", token)
            if (token && subscribed) {
                setUri(token)
            }
        };
        doAsync();
        return () => { subscribed = false }
    }, [])


    return (
        <>
            <Heading level={3}>Wallet</Heading>
            {uri &&
                <WalletConnectWallet uri={"wc:ba7642b810ff2a975ed9fce30aa96897ddfaf191d1761bbed29fcb43a9b2dbf0@2?controller=false&publicKey=da996540489e2af21b71c475e493b526eef03e91f34b99c2e50bebf5a1782b2c&relay=%7B%22protocol%22%3A%22waku%22%7D"}></WalletConnectWallet>
            }
        </>
    )
}