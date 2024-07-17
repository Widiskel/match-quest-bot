import { LineBuffer, Twisters } from "twisters";
import logger from "./logger.js";
import { Match } from "../core/match.js";

class Twist {
  constructor() {
    /** @type  {Twisters}*/
    this.twisters = new Twisters({});
  }

  /**
   * @param {string} acc
   * @param {Match} match
   * @param {string} msg
   * @param {string} delay
   */
  log(msg = "", acc = {}, match = new Match(), delay) {
    if (delay == undefined) {
      logger.info(`${acc.id} - ${msg}`);
      delay = "-";
    }

    const profile = match.profile ?? {};
    const balance = profile.Balance ? profile.Balance / 1000 : "-";
    const misisons = profile.task_total_count ?? "-";
    const finishedMissions = profile.task_finished_count ?? "-";
    const farmingSpeed = profile.total_speed ?? "-";
    const reward = match.reward ?? {};
    const miningStatus = reward.reward ? reward.reward / 1000 : "-";
    const rule = match.rule ?? {};
    const gameCount = rule.game_count ?? "-";

    this.twisters.put(acc.id, {
      text: `
================= Account ${acc.id} =============
Name                 : ${acc.firstName} ${acc.lastName}
Balance              : ${balance}
Missions Finished    : ${finishedMissions}/${misisons}
Farming Speed        : ${farmingSpeed}
Farmed Points        : ${miningStatus}
Available Game Count : ${gameCount}

Status : ${msg}
Delay : ${delay}
==============================================`,
    });
  }

  clear() {
    this.twisters.flush();
  }

  /**
   * @param {string} msg
   */
  info(msg = "") {
    this.twisters.put(2, {
      text: `
==============================================
Info : ${msg}
==============================================`,
    });
    return;
  }

  cleanInfo() {
    this.twisters.remove(2);
  }
}
export default new Twist();
