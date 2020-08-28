import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import PublicSentimentReport from './containers/PublicSentimentReport';
import PoliticalRumor from './containers/PoliticalRumor';

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route exact path={routes.HOME} component={HomePage} />
        <Route
          exact
          path={routes.PUBLIC_SENTIMENT_REPORT}
          component={PublicSentimentReport}
        />
        <Route exact path={routes.POLITICAL_RUMOR} component={PoliticalRumor} />
      </Switch>
    </App>
  );
}
