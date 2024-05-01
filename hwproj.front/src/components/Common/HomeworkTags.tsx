import * as React from "react";
import {FC} from "react";

const TestTag = "Контрольная работа"
const BonusTag = "Доп. баллы"

export const TestTip: FC = () => <sup style={{color: "#2979ff"}}> тест</sup>

export default {TestTag, BonusTag}
