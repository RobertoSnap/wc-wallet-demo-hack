import { Box, Button, Footer, Grommet, Header, Main, Paragraph, Text } from 'grommet';
import { Home } from 'grommet-icons';
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { HomePage } from './pages/Home';

function App() {

  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Grommet full={true}>
        {/* <Symfoni autoInit={true} showLoading={true}> */}
        <Box height={{ min: "100vh" }}>
          {/* Navigation */}
          <Header background="brand">
            <Button icon={<Home />} hoverIndicator />
            <Box direction="row">
              {/* <Link to="/relations" style={{ alignSelf: "center" }}>
                  <Anchor size="medium" label="Relasjoner" />
                </Link> */}
              <Box pad="small">
                <Button label="Koble til MobileConnect"></Button>
              </Box>
            </Box>
          </Header>
          {/* Content swtich */}
          <Main pad="xlarge" height={{ min: "75vh" }} >
            <Switch>
              <Route exact path="/" component={HomePage} />
              {/* <Route exact path="/relations" component={} /> */}
            </Switch>
          </Main>
          {/* footer */}
          <Footer background="brand" pad="medium" height={{ min: "10vh" }}>
            <Box align="center" justify="center" alignContent="center" fill="horizontal" >
              <Text textAlign="center" size="small">
                <Paragraph>My Kindegarde App</Paragraph>
              </Text>
            </Box>
          </Footer>
        </Box>
        {/* </Symfoni> */}
      </Grommet>
    </BrowserRouter >
  );
}

export default App;
