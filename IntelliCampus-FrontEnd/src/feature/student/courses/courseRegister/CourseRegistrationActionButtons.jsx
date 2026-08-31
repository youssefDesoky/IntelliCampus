import { useTranslation } from 'react-i18next';
import Button from "../../../../components/ui/Button";
import { CheckIcon } from "../../../../components/ui/icons";

export default function CoursesRegistrationActionButtons({ onConfirm }) {
    const { t } = useTranslation('student');
    return(
        <div className="w-full md:w-1/4">
            <Button
                variant="primary"
                onClick={onConfirm}
                width="w-full"
            >
                <CheckIcon size={20} />
                {t('registration.confirm')}
            </Button>
        </div>
    );
}