import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import PublicSentimentReport from './containers/PublicSentimentReport';
// import CounterPage from './containers/CounterPage';

export default function Routes() {
  return (
    <App>
      <Switch>
        {/* <Route path={routes.COUNTER} component={CounterPage} /> */}
        <Route exact path={routes.HOME} component={HomePage} />
        <Route exact path={routes.PUBLIC_SENTIMENT_REPORT} component={PublicSentimentReport} />
      </Switch>
    </App>
  );
}
