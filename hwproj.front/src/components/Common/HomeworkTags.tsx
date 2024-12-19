import * as React from "react";
import {FC} from "react";
import ValidationUtils from "../Utils/ValidationUtils";

export const TestTag = "Контрольная работа"
export const BonusTag = "Доп. баллы"
export const GroupWorkTag = "Командная работа"
export const DefaultTags = [TestTag, BonusTag, GroupWorkTag]

export const isTestWork = (tagsOwner: { tags?: string[] }) => tagsOwner.tags?.includes(TestTag) ?? false
export const isBonusWork = (tagsOwner: { tags?: string[] }) => tagsOwner.tags?.includes(BonusTag) ?? false

const TestTip: FC = () => <sup style={{color: "#2979ff"}}> тест</sup>
const BonusTip: FC = () => <sup style={{color: "green"}}> бонус</sup>

export const getTip = (tagsOwner: { tags?: string[] }) => {
    const tags = tagsOwner.tags
    if (ValidationUtils.isNullOrUndefined(tags)) return null
    if (tags.includes(TestTag)) return <TestTip/>
    if (tags.includes(BonusTag)) return <BonusTip/>
    return null
}
