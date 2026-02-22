import * as React from "react";
import {FC} from "react";

export const TestTag = "Контрольная работа"
export const BonusTag = "Доп. баллы"
export const GroupWorkTag = "Командная работа"
export const DefaultTags = [TestTag, BonusTag, GroupWorkTag]

export const isTestWork = (tagsOwner: { tags?: string[] }) => tagsOwner.tags?.includes(TestTag) ?? false
export const isBonusWork = (tagsOwner: { tags?: string[] }) => tagsOwner.tags?.includes(BonusTag) ?? false

export const TestTip: FC = () => <sup style={{color: "#2979ff"}}> тест</sup>
const BonusTip: FC = () => <sup style={{color: "green"}}> бонус</sup>
const TestBonusTip: FC = () => <sup style={{color: "#2979ff"}}> бонус</sup>

export const getTip = (tagsOwner: { tags?: string[] }) => {
    const tags = tagsOwner.tags
    if (tags == null) return null

    if (tags.includes(BonusTag)) {
        if (tags.includes(TestTag)) return <TestBonusTip/>
        return <BonusTip/>
    }
    if (tags.includes(TestTag)) return <TestTip/>
    return null
}
