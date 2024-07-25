import { Config } from "./src/config/config.js";
import { Match } from "./src/core/match.js";
import { Telegram } from "./src/core/telegram.js";
import { Helper } from "./src/utils/helper.js";
import logger from "./src/utils/logger.js";
import twist from "./src/utils/twist.js";

async function operation(user, query, queryObj) {
  try {
    const match = new Match(user, query, queryObj);
    twist.log(`Getting User Info`, user, match);
    await match.login();
    await Helper.sleep(1000, user, `Successfully Get User Info`, this);

    await match.getTaskList();
    for (const task of match.task) {
      if (task.complete == false) {
        await match.completeTask(task.name);
      }
    }

    let miningBoostProduct;
    let gameChanceProduct;
    if (match.product.length > 0) {
      miningBoostProduct = match.product.filter((item) =>
        item.name.includes("Daily Booster")
      );
      if (miningBoostProduct.length > 0) {
        if (
          match.profile.Balance / 1000 > miningBoostProduct[0].point &&
          miningBoostProduct[0].current_count !=
            miningBoostProduct[0].task_count
        ) {
          await match.purchaseProduct(miningBoostProduct[0].type);
        }
      }
      gameChanceProduct = match.product.filter((item) =>
        item.name.includes("Game Booster")
      );
      if (gameChanceProduct.length > 0) {
        if (
          match.profile.Balance / 1000 > gameChanceProduct[0].point &&
          gameChanceProduct[0].current_count != gameChanceProduct[0].task_count
        ) {
          await match.purchaseProduct(gameChanceProduct[0].type);
        }
      }
    }
    await match.checkFarmingReward();
    const farm = setInterval(async () => {
      await match.checkFarmingReward();
    }, 5000);

    if (
      match.reward.next_claim_timestamp - Date.now() <= 0 &&
      match.reward.reward != 0
    ) {
      await match.claimMiningReward();
    }
    await match.startFarming();

    await match.getTaskList();
    for (const task of match.task) {
      if (task.complete == false) {
        await match.completeTask(task.name);
      }
    }

    while (match.rule.game_count != 0) {
      await match.playGame();
      if (match.rule.game_count != 0) {
        await Helper.sleep(
          5000,
          user,
          `Delaying for 5 Sec before playing next game`,
          match
        );
      }
    }

    if (mode == 1) {
      await Helper.sleep(
        match.reward.next_claim_timestamp - Date.now(),
        user,
        `Account Processing Done Delaying for ${Helper.msToTime(
          match.reward.next_claim_timestamp - Date.now()
        )} Before Restarting`,
        match
      );
    } else {
      await Helper.sleep(
        10000,
        user,
        `Account Processing Done Continue Using Next Account after 10 Seconds`,
        match
      );
    }
    clearInterval(farm);
  } catch (error) {
    throw error;
  }
}

async function startBot() {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info(`BOT STARTED`);
      if (
        Config.TELEGRAM_APP_ID == undefined ||
        Config.TELEGRAM_APP_HASH == undefined
      ) {
        throw new Error(
          "Please configure your TELEGRAM_APP_ID and TELEGRAM_APP_HASH first"
        );
      }
      const tele = await new Telegram();
      if (init == false) {
        await tele.init();
        init = true;
        mode = tele.runMode;
      }
      const sessionList = Helper.getSession("sessions");
      const paramList = [];

      for (const acc of sessionList) {
        await tele.useSession("sessions/" + acc);
        tele.session = acc;
        const user = await tele.client.getMe();
        const query = await tele
          .resolvePeer()
          .then(async () => {
            return await tele.initWebView();
          })
          .catch((err) => {
            throw err;
          });

        const queryObj = Helper.queryToJSON(query);
        await tele.disconnect();
        paramList.push([user, query, queryObj]);
      }

      if (mode == 1) {
        const promiseList = paramList.map(async (data) => {
          await operation(data[0], data[1], data[2]);
        });

        await Promise.all(promiseList);
        twist.cleanInfo();
        twist.clear();
      } else {
        for (const data of paramList) {
          await operation(data[0], data[1], data[2]);
          twist.cleanInfo();
          twist.clear();
        }

        await Helper.sleep(
          60000 * 30,
          undefined,
          `All Account Processing done, delaying for 30 Minutes Before Restarting`,
          undefined
        );
        twist.clear();
        twist.cleanInfo();
      }

      await startBot().then(resolve);
    } catch (error) {
      logger.info(`BOT STOPPED`);
      logger.error(JSON.stringify(error));
      await startBot().then(resolve);
    }
  });
}

let mode = 1;
let init = false;
process.on("unhandledRejection", (reason) => {
  throw Error("Unhandled Rejection : " + reason);
});
(async () => {
  try {
    logger.clear();
    logger.info("");
    logger.info("Application Started");
    console.log("MATCHQUEST BOT");
    console.log("By : Widiskel");
    console.log("Dont forget to run git pull to keep up to date");
    await startBot();
  } catch (error) {
    twist.cleanInfo();
    twist.clear();
    console.log("Error During executing bot", error);
  }
})();
