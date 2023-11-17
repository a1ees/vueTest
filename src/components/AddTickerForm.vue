<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @input="inputTicker"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div v-if="foundTickers.length">
          <div class="flex bg-white p-1 rounded-md shadow-md flex-wrap">
            <span
              v-for="tiker in foundTickers.slice(0, 4)"
              :key="tiker"
              @click="autoComplite(tiker)"
              class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
            >
              {{ tiker.toString() }}
            </span>
          </div>
        </div>
        <div v-if="errorTicker" class="text-sm text-red-600">
          Такой тикер уже добавлен
        </div>
      </div>
    </div>
    <add-button-ticker @click="add" />
  </section>
</template>

<script>
import AddButtonTicker from "./AddButtonTicker.vue";

export default {
  name: "AddTickerForm",
  components: {
    AddButtonTicker,
  },
  props: {
    tickers: {
      required: true,
      default: [],
    }
  },
  data() {
    return {
      ticker: "",
      allCurrencies: [],
      foundTickers: [],
      errorTicker: false,
    };
  },
  async mounted() {
    const f = await fetch(
      "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
    );
    const responseData = await f.json();
    this.allCurrencies = Object.keys(responseData.Data).map((key) => {
      return responseData.Data[key].Symbol;
    });
  },
  methods: {
    add() {
      if (
        this.tickers.some(
          (i) => i.name.toUpperCase() === this.ticker.toUpperCase()
        )
      ) {
        this.errorTicker = true;
      } else {
        this.$emit("add-ticker", this.ticker);
        this.ticker = "";
      }
    },
    inputTicker() {
      this.errorTicker = false;
      if (this.ticker) {
        this.foundTickers = this.allCurrencies.filter((i) =>
          i.startsWith(this.ticker.toUpperCase())
        );
      } else {
        this.foundTickers = [];
      }
    },
    autoComplite(tiker) {
      this.ticker = tiker;
      this.add();
      this.foundTickers = [];
    },
  },
};
</script>
