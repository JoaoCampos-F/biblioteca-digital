import { createApp } from "vue";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";
import App from "./App.vue";
import { router } from "./routes/Index";

const vuetify = createVuetify({
  theme: {
    defaultTheme: "anderson",
    themes: {
      anderson: {
        dark: false,
        colors: {
          primary: "#FF0000",
        },
      },
    },
  },
  components,
  directives,
});

createApp(App).use(vuetify).use(router).mount("#app");
