"use strict";

module.exports = (sequelize, DataTypes) => {
    const TeamCase = sequelize.define(
        "TeamCase",
        {
            team_case_id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
            },

            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },

            case_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },

            formed_by: {
                type: DataTypes.UUID,
                allowNull: false,
            },

            is_team_leader: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },

            created_at: {
                type: DataTypes.DATE,
            },

            updated_at: {
                type: DataTypes.DATE,
            },
        },
        {
            tableName: "TeamCases",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    TeamCase.associate = function (models) {
        TeamCase.belongsTo(models.AdministratorAccounts, {
            foreignKey: "user_id",
            as: "user",
        });

        TeamCase.belongsTo(models.Case, {
            foreignKey: "case_id",
            as: "case",
        });

        TeamCase.belongsTo(models.AdministratorAccounts, {
            foreignKey: "formed_by",
            as: "creator",
        });
    };

    return TeamCase;
};
