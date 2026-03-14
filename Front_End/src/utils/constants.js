// src/utils/constants.js

export const ROLES = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    EMPLOYEE: 'EMPLOYEE',
};

export const ROLE_LABELS = {
    [ROLES.ADMIN]: 'Administrateur',
    [ROLES.MANAGER]: 'Manager',
    [ROLES.EMPLOYEE]: 'Employé',
};

export const CONGE_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
};

export const CONGE_STATUS_LABELS = {
    [CONGE_STATUS.PENDING]: 'En attente',
    [CONGE_STATUS.APPROVED]: 'Approuvé',
    [CONGE_STATUS.REJECTED]: 'Refusé',
};

export const CONGE_STATUS_BADGE = {
    [CONGE_STATUS.PENDING]: 'badge-yellow',
    [CONGE_STATUS.APPROVED]: 'badge-green',
    [CONGE_STATUS.REJECTED]: 'badge-red',
};
