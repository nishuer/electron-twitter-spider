import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import Twitter from './containers/Twitter';
import PublicSentimentReport from './containers/PublicSentimentReport';
import PoliticalRumor from './containers/PoliticalRumor';
import GreatFirewall from './containers/GreatFirewall';

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route exact path={routes.POLITICAL_RUMOR} component={PoliticalRumor} />
        <Route exact path={routes.GREAT_FIREWALL} component={GreatFirewall} />
        <Route exact path={routes.TWITTER} component={Twitter} />
        <Route
          exact
          path={routes.PUBLIC_SENTIMENT_REPORT}
          component={PublicSentimentReport}
        />
      </Switch>
    </App>
  );
}
