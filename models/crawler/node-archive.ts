import axios from "axios";
import * as cheerio from "cheerio";

import { getCafe24Data } from ".";
import { ICrawler, evaluateData, evaluateResponse } from "../../types/Crawl";
import { formatData } from "../../lib/Cafe24Parser";
import { getProductNum } from "../../lib/URLparser";

declare const EC_SHOP_FRONT_NEW_OPTION_DATA;

export default class NodeArchiveCrawler implements ICrawler {
  url: string;
  productNum: number;

  evaluate = (productNum: number): evaluateResponse => {
    return {
      type: "stock" as evaluateData,
      data: EC_SHOP_FRONT_NEW_OPTION_DATA.aItemStockData[productNum],
    };
  };

  getOptionNames = async () => {
    const optionNames = [];
    const { data: body } = await axios(this.url);
    const hi = cheerio.load(body);
    hi("#product_option_id1").each((_, ele) => {
      optionNames.push(ele.attribs.option_title);
    });
    return Promise.resolve(optionNames);
  };

  constructor(url: string) {
    this.url = url;
    this.productNum = getProductNum(url);
  }

  request = async () => {
    const optionNames = await this.getOptionNames();
    const { type, data } = await getCafe24Data(
      this.url,
      this.evaluate,
      this.productNum
    );
    const option = formatData(type, data, optionNames);
    return Promise.resolve(option);
  };
}
