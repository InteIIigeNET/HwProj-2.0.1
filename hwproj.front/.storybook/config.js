import {addDecorator, configure} from '@storybook/react';
import {withKnobs} from "@storybook/addon-knobs";

addDecorator(withKnobs);

const req = require.context('../src/components/', true, /.stories.(jsx|tsx)$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
