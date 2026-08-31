import { 
    Form, 
    Link,
    useActionData, 
    useNavigate, 
    useNavigation 
} from "react-router-dom";
import { useTranslation } from 'react-i18next';

import { useEffect, useState, useRef } from "react";

import AuthLayout from "../../layout/AuthLayout";

import Button from "../../components/ui/Button";
import InputItem from "../../components/form/InputItem";
import { LockIconLight , MailIconLight } from "../../components/ui/icons";

export default function LoginPage() {
    const { t } = useTranslation('auth');
    // const emailRef = useRef(null);
    // const passwordRef = useRef(null);

    // const [emptyFields, setEmptyFields] = useState([]);

    const data = useActionData();
    // const navigate = useNavigate();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    // useEffect(() => {
    //     if (!data) return;

    //     const userRole = data.role;

    //     localStorage.setItem("token", data.token);
    //     localStorage.setItem("user-role", userRole);

    //     if (userRole === "student") navigate("/");
    //     else if (userRole === "instructor") navigate("/instructor");
    //     else if (userRole === "admin") navigate("/admin");
    // }, [data, navigate]);

    // const handelOnSubmit = (event) => {
    //     event.preventDefault();

    //     setEmptyFields([]);

    //     if (!emailRef.current.value) {
    //         setEmptyFields((prev) => [...prev, "email"]);    
    //     }
    //     if (!passwordRef.current.value) {
    //         setEmptyFields((prev) => [...prev, "password"]);    
    //     }

    //     if (!emailRef.current.value || !passwordRef.current.value) return;
        
    //     // Let React Router handle the form submission naturally
    //     event.currentTarget.submit();
    // }

    return (
        <AuthLayout 
            title={t('login.title')}
            subtitle={t('login.subtitle')}
        >
            <Form
                method="post"
                className="space-y-5 mb-12"
            >
                {data?.message && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-md text-center">
                        {data.message}
                    </div>
                )}

                <InputItem
                    label={t('login.emailLabel')}
                    type="email"
                    name="email"
                    placeholder={t('login.emailPlaceholder')}
                >
                    <MailIconLight className="w-5 h-5 text-gray-400" />
                </InputItem>

                <InputItem
                    label={t('login.passwordLabel')}
                    type="password"
                    name="password"
                    placeholder={t('login.passwordPlaceholder')}
                >
                    <LockIconLight className="w-5 h-5 text-gray-400" />
                </InputItem>

                <Button 
                    type="submit" 
                    width="w-full"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                >
                    {t('login.submit')}
                </Button>
            </Form>

            <div className="text-center space-y-2">
                <Link to="/forgot-password" className="text-blue-500 hover:text-blue-600 text-md block">
                    {t('login.forgotPassword')}
                </Link>
                <Link to="/get-credentials" className="text-blue-500 hover:text-blue-600 text-md block">
                    {t('login.getCredentials')}
                </Link>
                <p className="text-gray-400 text-sm">{t('login.adminNote')}</p>
            </div>
        </AuthLayout>
    );
}