import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import { SubCategoryEntity } from "@/sub-category/entity/sub-category.entity";


@Entity('services_addons')
export class AddonsEntity {

    @PrimaryGeneratedColumn({name: 'pk_service_addon'})
    pkAddon: number;


    @Column({default: 1, name:"is_retail"})
    isRetail: number;


    @Column({name:"name",nullable:false, type:"varchar"})
    name: string;

    @Column({name:"description",nullable:true, type:"varchar"})
    description: string;

    @Column({name:"content_web",nullable:true, type:"varchar"})
    contentWeb: string;

    @Column({name:"price",nullable:true, type:"varchar"})
    price: number;

    @Column({default: 1})
    status: number;

    @Column({ name:'createdAt', type: "timestamp", default: () => 'CURRENT_TIMESTAMP'})
    createdAt : Date;

    @Column({ name:'updatedAt', type: "timestamp", default: () => 'CURRENT_TIMESTAMP'})
    updatedAt : Date;

    @ManyToOne(() => SubCategoryEntity, (subCategory) => subCategory.addons)
    @JoinColumn({ name: 'fk_service' })
    subCategory: SubCategoryEntity;
}
