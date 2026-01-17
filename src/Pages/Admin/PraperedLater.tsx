import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Typography, Alert, Progress } from 'antd';
import {
    ClockCircleOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const AR = {
    title: 'الصفحة قيد التحضير',
    subtitle: 'نحن نعمل حاليًا على تجهيز هذه الصفحة لتقديم تجربة استخدام مميزة',
    progress: 'نسبة التقدم',
    message:
        'يتم تطوير هذه الصفحة بعناية عالية لضمان أفضل أداء وتجربة مستخدم. نشكركم على صبركم.',
    features: 'المميزات المخطط لها',
    feature1: 'تصميم احترافي باستخدام Ant Design',
    feature2: 'حركات وانتقالات سلسة باستخدام Framer Motion',
    feature3: 'تصميم متجاوب باستخدام Tailwind CSS',
    feature4: 'دعم تعدد اللغات',
    notify: 'أشعرني عند الجاهزية',
    notified: 'تم تسجيل الإشعار بنجاح',
    back: 'العودة إلى الصفحة الرئيسية',
};

const PreparedLater: React.FC = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 85) {
                    clearInterval(timer);
                    return 85;
                }
                return prev + 1;
            });
        }, 40);

        return () => clearInterval(timer);
    }, []);


    return (
        <div
            dir="rtl"
            className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="max-w-6xl mx-auto"
            >
                <Card className="rounded-2xl shadow-2xl border-0 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-[#17ab5b] to-[#17ab5b]" />

                    <div className="p-8 md:p-12 relative">
                        {/* Icon */}
                        <div className="flex justify-center mb-8">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 12,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                                className="bg-gradient-to-br from-green-100 to-white p-6 rounded-2xl shadow-lg"
                            >
                                <ClockCircleOutlined className="text-6xl text-green-600" />
                            </motion.div>
                        </div>

                        {/* Title */}
                        <Title className="text-center text-gray-800">
                            {AR.title}
                        </Title>

                        <Paragraph className="text-center text-lg text-gray-600 max-w-2xl mx-auto mb-10">
                            {AR.subtitle}
                        </Paragraph>

                        {/* Progress */}
                        <div className="mb-10">
                            <div className="flex justify-between mb-2">
                                <Text strong>{AR.progress}</Text>
                                <Text strong className="text-blue-600">
                                    {progress}%
                                </Text>
                            </div>

                            <Progress
                                percent={progress}
                                strokeColor={{
                                    '0%': '#17ab5b',
                                    '100%': '#17ab5b',
                                }}
                                strokeWidth={6}
                            />

                            <Alert
                                message={AR.message}
                                type="info"
                                showIcon
                                className="mt-6 rounded-lg"
                            />
                        </div>



                    </div>
                </Card>


            </motion.div>
        </div>
    );
};

export default PreparedLater;


