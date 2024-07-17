import { API } from "../api/api.js";
import { Helper } from "../utils/helper.js";
import logger from "../utils/logger.js";
import twist from "../utils/twist.js";

export class Match extends API {
  constructor(account, query, queryObj) {
    super(query, "https://tgapp-api.matchain.io", "tgapp-api.matchain.io");
    this.account = account;
    this.query = query;
    this.queryObj = queryObj;
  }

  async login() {
    return new Promise(async (resolve, reject) => {
      const body = {
        uid: Number(this.account.id),
        first_name: this.account.firstName,
        last_name: this.account.lastName,
        username: this.account.username,
        tg_login_params: this.query,
      };
      await this.fetch("/api/tgapp/v1/user/login", "POST", undefined, body)
        .then(async (data) => {
          this.token = data.data.token;
          this.user = data.data.user;
          await this.getGameRule();
          await this.getProfile();
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async getProfile() {
    return new Promise(async (resolve, reject) => {
      const body = {
        uid: Number(this.account.id),
      };
      await this.fetch("/api/tgapp/v1/user/profile", "POST", this.token, body)
        .then(async (data) => {
          this.profile = data.data;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async getTaskList() {
    return new Promise(async (resolve, reject) => {
      const body = {
        uid: Number(this.account.id),
      };
      await this.fetch(
        "/api/tgapp/v1/point/task/list",
        "POST",
        this.token,
        body
      )
        .then(async (data) => {
          this.task = data.data.Tasks;
          await Helper.sleep(
            2000,
            this.account,
            `Successfully Get User Available Task`,
            this
          );
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async completeTask(taskType) {
    await Helper.sleep(
      1000,
      this.account,
      `Completing Task With type ${taskType}`,
      this
    );
    return new Promise(async (resolve, reject) => {
      const body = {
        uid: Number(this.account.id),
        type: taskType,
      };
      await this.fetch(
        "/api/tgapp/v1/point/task/complete",
        "POST",
        this.token,
        body
      )
        .then(async (data) => {
          if (data.code == 200) {
            await Helper.sleep(
              2000,
              this.account,
              `Successfully Complete task`,
              this
            );
            await this.claimTaskReward(body);
          } else {
            await Helper.sleep(
              2000,
              this.account,
              `Failed to Complete Task ${data.err}`,
              this
            );
          }
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async claimTaskReward(body) {
    await Helper.sleep(
      1000,
      this.account,
      `Claiming Task With type ${body.type}`,
      this
    );
    return new Promise(async (resolve, reject) => {
      await this.fetch(
        "/api/tgapp/v1/point/task/claim",
        "POST",
        this.token,
        body
      )
        .then(async (data) => {
          if (data.code == 200) {
            await Helper.sleep(
              2000,
              this.account,
              `Successfully Claim Task Reward`,
              this
            );
            await this.getProfile();
          } else {
            await Helper.sleep(
              2000,
              this.account,
              `Failed to Claim Task Reward ${data.err}`,
              this
            );
          }
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async getGameRule() {
    await Helper.sleep(1000, this.account, `Getting Game Rule`, this);
    return new Promise(async (resolve, reject) => {
      await this.fetch("/api/tgapp/v1/game/rule", "GET", this.token)
        .then(async (data) => {
          this.rule = data.data;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async playGame() {
    await Helper.sleep(1000, this.account, `Playing Game...`, this);
    return new Promise(async (resolve, reject) => {
      await this.fetch("/api/tgapp/v1/game/play", "GET", this.token)
        .then(async (data) => {
          this.gameId = data.data.game_id;
          this.rule.game_count = data.data.game_count;
          await Helper.sleep(
            30000,
            this.account,
            `Delaying for 30 Second before claiming game..`,
            this
          );
          await this.claimGame(Helper.random(100, 200));
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async claimGame(score) {
    await Helper.sleep(
      3000,
      this.account,
      `Claiming Game with score ${score}...`,
      this
    );
    const body = {
      game_id: this.gameId,
      point: score,
    };
    return new Promise(async (resolve, reject) => {
      await this.fetch("/api/tgapp/v1/game/claim", "POST", this.token, body)
        .then(async (data) => {
          await this.getProfile();
          if (data.code == 200) {
            await Helper.sleep(
              3000,
              this.account,
              `Game Claimed with score ${score}`,
              this
            );
          } else {
            await Helper.sleep(
              3000,
              this.account,
              `Error Claiming Game - ${data.err}`,
              this
            );
          }
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async startFarming() {
    twist.log(`Starting farming`, this.account, this);
    return new Promise(async (resolve, reject) => {
      const body = {
        uid: Number(this.account.id),
      };
      await this.fetch(
        "/api/tgapp/v1/point/reward/farming",
        "POST",
        this.token,
        body
      )
        .then(async (data) => {
          if (data.code == 200) {
            await this.getProfile();
            await Helper.sleep(
              3000,
              this.account,
              `Farming Started Successfully`,
              this
            );
            await this.checkFarmingReward();
          } else {
            await this.getProfile();
            await Helper.sleep(3000, this.account, data.err, this);
            await this.checkFarmingReward();
          }
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async checkFarmingReward() {
    return new Promise(async (resolve, reject) => {
      const body = {
        uid: Number(this.account.id),
      };
      await this.fetch("/api/tgapp/v1/point/reward", "POST", this.token, body)
        .then(async (data) => {
          this.reward = data.data;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
