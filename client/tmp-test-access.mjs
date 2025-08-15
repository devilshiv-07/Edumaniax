import { AccessController } from './src/utils/accessControl.js';

const subscriptions = [
    {
        "id": "cme95m8dr00037c78xmr41hf8",
        "userId": "cmdooj9t90000s60gqxu48m2n",
        "planType": "SOLO",
        "status": "ACTIVE",
        "startDate": "2025-08-12T23:09:53.776Z",
        "endDate": "2025-09-11T23:09:53.773Z",
        "amount": 199,
        "createdAt": "2025-08-12T23:09:53.776Z",
        "updatedAt": "2025-08-12T23:09:53.776Z",
        "notes": "{\"selectedModule\":\"Communication Skills\"}",
        "payments": [
            {
                "id": "cme95m8a400017c78i5jgcfvg",
                "userId": "cmdooj9t90000s60gqxu48m2n",
                "subscriptionId": "cme95m8dr00037c78xmr41hf8",
                "razorpayOrderId": "order_R4bCAtaJpeHrkt",
                "razorpayPaymentId": "pay_R4bDnEt0RDBbX6",
                "amount": 199,
                "currency": "INR",
                "status": "COMPLETED",
                "planType": "SOLO",
                "createdAt": "2025-08-12T23:09:53.546Z",
                "updatedAt": "2025-08-12T23:09:53.881Z",
                "notes": "{\"selectedModule\":\"Communication Skills\"}"
            }
        ],
        "remainingDays": 29,
        "daysSincePurchase": 1,
        "isExpired": false,
        "selectedModule": "Communication Skills",
        "daysUsed": 1,
        "totalDays": 30,
        "usagePercentage": 3
    },
    {
        "id": "cme8ywc8400037cis30fvarm4",
        "userId": "cmdooj9t90000s60gqxu48m2n",
        "planType": "SOLO",
        "status": "ACTIVE",
        "startDate": "2025-08-12T20:01:48.004Z",
        "endDate": "2025-09-11T20:01:48.003Z",
        "amount": 199,
        "createdAt": "2025-08-12T20:01:48.004Z",
        "updatedAt": "2025-08-12T20:01:48.004Z",
        "notes": "{\"selectedModule\":\"Fundamentals of Finance\"}",
        "payments": [
            {
                "id": "cme8ywbqq00017cisqrnq8ad8",
                "userId": "cmdooj9t90000s60gqxu48m2n",
                "subscriptionId": "cme8ywc8400037cis30fvarm4",
                "razorpayOrderId": "order_R4Y0h5Be9OyQUH",
                "razorpayPaymentId": "pay_R4Y10ZJoCUKnN6",
                "amount": 199,
                "currency": "INR",
                "status": "COMPLETED",
                "planType": "SOLO",
                "createdAt": "2025-08-12T20:01:47.367Z",
                "updatedAt": "2025-08-12T20:01:48.555Z",
                "notes": "{\"selectedModule\":\"Fundamentals of Finance\"}"
            }
        ],
        "remainingDays": 29,
        "daysSincePurchase": 1,
        "isExpired": false,
        "selectedModule": "Fundamentals of Finance",
        "daysUsed": 1,
        "totalDays": 30,
        "usagePercentage": 3
    }
];

const controller = new AccessController(subscriptions, null);
console.log('currentPlan:', controller.currentPlan);
console.log('soloModules:', controller.soloModules);

const moduleKeys = [
  'finance','computers','law','communication','entrepreneurship','digital-marketing','leadership','environment','sel'
];

for (const m of moduleKeys) {
  console.log(m, {
    isPurchased: controller.isModulePurchased(m),
    hasModuleAccess: controller.hasModuleAccess(m),
    hasLevel1Access: controller.hasLevelAccess(m, 1)
  });
}
