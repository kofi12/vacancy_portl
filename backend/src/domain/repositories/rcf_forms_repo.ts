import type { BaseRepo } from "./base_repo.ts";
import { RcfForm } from "../entities/rcf_form.ts";


export interface RcfFormRepo extends BaseRepo<RcfForm> {
    findAllByRcfId(rcfId: string): Promise<RcfForm[]>;
}
