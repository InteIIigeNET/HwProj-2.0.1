import * as React from "react";
import {FC} from "react";

export const TestTag = "Контрольная работа"
export const BonusTag = "Доп. баллы"

const TestTip: FC = () => <sup style={{color: "#2979ff"}}> тест</sup>
const BonusTip: FC = () => <sup style={{color: "green"}}> бонус</sup>

export const getTip = (tagsOwner: { tags?: string[] }) => {
    const tags = tagsOwner.tags
    if (tags == undefined) return null
    if (tags.includes(TestTag)) return <TestTip/>
    if (tags.includes(BonusTag)) return <BonusTip/>
    return null
}
