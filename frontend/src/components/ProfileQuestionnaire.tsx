import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleChip } from "@/components/ToggleChip";
import { ExpertiseLevelPicker } from "@/components/ExpertiseLevelPicker";
import { useTranslation } from "@/contexts/LanguageContext";
import { INTEREST_OPTIONS } from "@/lib/onboardingOptions";
import { DIGEST_SIZE_OPTIONS } from "@/lib/digest";

interface ProfileQuestionnaireProps {
  name: string;
  onNameChange: (name: string) => void;
  expertiseLevel: string;
  onExpertiseLevelChange: (level: string) => void;
  interests: string[];
  onToggleInterest: (interest: string) => void;
  digestSize: number;
  onDigestSizeChange: (size: number) => void;
}

export function ProfileQuestionnaire({
  name,
  onNameChange,
  expertiseLevel,
  onExpertiseLevelChange,
  interests,
  onToggleInterest,
  digestSize,
  onDigestSizeChange,
}: ProfileQuestionnaireProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">{t.questionnaire.nameLabel}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t.questionnaire.namePlaceholder}
        />
      </div>

      <div className="space-y-2">
        <Label>{t.questionnaire.expertiseLabel}</Label>
        <ExpertiseLevelPicker value={expertiseLevel} onChange={onExpertiseLevelChange} />
      </div>

      <div className="space-y-2">
        <Label>{t.questionnaire.interestsLabel}</Label>
        <div className="flex flex-wrap gap-2">
          {/* The English string stays the stored value (the backend's curator
              prompt reads it) - only the chip's label is translated. */}
          {INTEREST_OPTIONS.map((interest) => (
            <ToggleChip
              key={interest}
              label={t.interests[interest] ?? interest}
              selected={interests.includes(interest)}
              onClick={() => onToggleInterest(interest)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t.questionnaire.digestSizeLabel}</Label>
        <div className="flex flex-wrap gap-2">
          {DIGEST_SIZE_OPTIONS.map((size) => (
            <ToggleChip
              key={size}
              label={t.questionnaire.storiesOption(size)}
              selected={digestSize === size}
              onClick={() => onDigestSizeChange(size)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
